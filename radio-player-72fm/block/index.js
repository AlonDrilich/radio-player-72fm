/**
 * 72FM Radio Player block (editor side).
 *
 * Plain JavaScript on the globals WordPress already loads, so there is no build
 * step. The front end is rendered by PHP (radio72fm_render_block), so this file
 * only handles picking a station and previewing it.
 *
 * The only network request this file makes is a station search against the
 * Radio Browser public API, and only when the editor presses Search.
 */
( function ( wp ) {
	'use strict';

	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useState = wp.element.useState;
	var __ = wp.i18n.__;
	var sprintf = wp.i18n.sprintf;
	var registerBlockType = wp.blocks.registerBlockType;
	var blockEditor = wp.blockEditor;
	var components = wp.components;

	var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	var MIRRORS = [
		'https://de1.api.radio-browser.info',
		'https://de2.api.radio-browser.info',
		'https://all.api.radio-browser.info',
	];
	var TIMEOUT_MS = 6000;

	/**
	 * Same rules as radio72fm_parse_station_id() in PHP: a bare UUID, or a
	 * 72fm.com /station/ or /embed/ link. Anything else is rejected.
	 *
	 * @param {string} input Pasted value.
	 * @return {string} Lower-case UUID or ''.
	 */
	function parseStationId( input ) {
		var value = String( input || '' ).trim();
		if ( ! value || value.length > 300 ) {
			return '';
		}
		if ( UUID_RE.test( value ) ) {
			return value.toLowerCase();
		}
		if ( /^(?:www\.)?72fm\.com\//i.test( value ) ) {
			value = 'https://' + value;
		}
		var url;
		try {
			url = new URL( value );
		} catch ( e ) {
			return '';
		}
		var host = url.hostname.toLowerCase();
		if ( host !== '72fm.com' && host !== 'www.72fm.com' ) {
			return '';
		}
		var match = url.pathname.match( /^\/(?:station|embed)\/([^/]+)\/?$/ );
		if ( match && UUID_RE.test( match[ 1 ] ) ) {
			return match[ 1 ].toLowerCase();
		}
		return '';
	}

	function fetchWithTimeout( url ) {
		var controller = typeof AbortController === 'function' ? new AbortController() : null;
		var timer = controller
			? setTimeout( function () {
					controller.abort();
			  }, TIMEOUT_MS )
			: null;
		return fetch( url, {
			method: 'GET',
			credentials: 'omit',
			referrerPolicy: 'no-referrer',
			signal: controller ? controller.signal : undefined,
		} ).then(
			function ( response ) {
				if ( timer ) {
					clearTimeout( timer );
				}
				if ( ! response.ok ) {
					throw new Error( 'HTTP ' + response.status );
				}
				return response.json();
			},
			function ( error ) {
				if ( timer ) {
					clearTimeout( timer );
				}
				throw error;
			}
		);
	}

	/**
	 * Search Radio Browser by station name, trying each mirror in turn.
	 *
	 * @param {string} term Search words.
	 * @return {Promise<Array>} Cleaned station list.
	 */
	function searchStations( term ) {
		var query =
			'/json/stations/search?name=' +
			encodeURIComponent( term ) +
			'&limit=10&hidebroken=true&order=votes&reverse=true';

		function attempt( index ) {
			if ( index >= MIRRORS.length ) {
				return Promise.reject( new Error( 'all mirrors failed' ) );
			}
			return fetchWithTimeout( MIRRORS[ index ] + query ).catch( function () {
				return attempt( index + 1 );
			} );
		}

		return attempt( 0 ).then( function ( data ) {
			if ( ! Array.isArray( data ) ) {
				return [];
			}
			return data
				.filter( function ( s ) {
					return s && typeof s.stationuuid === 'string' && UUID_RE.test( s.stationuuid ) && typeof s.name === 'string';
				} )
				.map( function ( s ) {
					var details = [ s.country, s.codec, s.bitrate ? s.bitrate + ' kbps' : '' ]
						.filter( function ( part ) {
							return typeof part === 'string' && part.trim() !== '';
						} )
						.join( ' · ' );
					return {
						id: s.stationuuid.toLowerCase(),
						name: s.name.trim().slice( 0, 200 ),
						details: details,
					};
				} );
		} );
	}

	function PlayerPreview( props ) {
		var id = props.stationId;
		var name = props.stationName;
		var title = name
			? sprintf( /* translators: %s: radio station name. */ __( '%s — live radio player', 'radio-player-72fm' ), name )
			: __( 'Live radio player', 'radio-player-72fm' );
		var linkText = name
			? sprintf( /* translators: %s: radio station name. */ __( 'Listen to %s on 72FM', 'radio-player-72fm' ), name )
			: __( 'Listen to this station on 72FM', 'radio-player-72fm' );

		return el(
			Fragment,
			null,
			el( 'iframe', {
				src: 'https://72fm.com/embed/' + encodeURIComponent( id ),
				width: '100%',
				height: 168,
				style: { border: 0, borderRadius: '12px', maxWidth: '420px', display: 'block' },
				loading: 'lazy',
				title: title,
			} ),
			props.showLink &&
				el(
					'p',
					{ className: 'radio72fm-link', style: { font: '13px system-ui,sans-serif', margin: '8px 0 0' } },
					el(
						'a',
						{
							href: 'https://72fm.com/station/' + encodeURIComponent( id ),
							onClick: function ( event ) {
								event.preventDefault();
							},
						},
						linkText
					)
				)
		);
	}

	function StationPicker( props ) {
		var termState = useState( '' );
		var term = termState[ 0 ];
		var setTerm = termState[ 1 ];

		var pastedState = useState( '' );
		var pasted = pastedState[ 0 ];
		var setPasted = pastedState[ 1 ];

		var statusState = useState( 'idle' ); // idle | loading | done | error
		var status = statusState[ 0 ];
		var setStatus = statusState[ 1 ];

		var resultsState = useState( [] );
		var results = resultsState[ 0 ];
		var setResults = resultsState[ 1 ];

		var pasteErrorState = useState( false );
		var pasteError = pasteErrorState[ 0 ];
		var setPasteError = pasteErrorState[ 1 ];

		function runSearch( event ) {
			if ( event ) {
				event.preventDefault();
			}
			var words = term.trim();
			if ( words.length < 2 ) {
				return;
			}
			setStatus( 'loading' );
			searchStations( words ).then(
				function ( list ) {
					setResults( list );
					setStatus( 'done' );
				},
				function () {
					setResults( [] );
					setStatus( 'error' );
				}
			);
		}

		function applyPasted( event ) {
			if ( event ) {
				event.preventDefault();
			}
			var id = parseStationId( pasted );
			if ( ! id ) {
				setPasteError( true );
				return;
			}
			setPasteError( false );
			props.onSelect( id, '' );
		}

		return el(
			components.Placeholder,
			{
				icon: 'format-audio',
				label: __( '72FM Radio Player', 'radio-player-72fm' ),
				instructions: __( 'Search for a station by name, or paste a 72fm.com station link.', 'radio-player-72fm' ),
				className: 'radio72fm-picker',
			},
			el(
				'form',
				{ className: 'radio72fm-search', onSubmit: runSearch },
				el( components.TextControl, {
					__nextHasNoMarginBottom: true,
					__next40pxDefaultSize: true,
					label: __( 'Station name', 'radio-player-72fm' ),
					value: term,
					onChange: setTerm,
					placeholder: __( 'e.g. jazz, news, or a station name', 'radio-player-72fm' ),
				} ),
				el(
					components.Button,
					{ variant: 'primary', type: 'submit', disabled: status === 'loading' || term.trim().length < 2, __next40pxDefaultSize: true },
					__( 'Search', 'radio-player-72fm' )
				)
			),
			el(
				'p',
				{ className: 'radio72fm-disclosure' },
				__( 'Searching sends your search words to the Radio Browser public API (radio-browser.info).', 'radio-player-72fm' )
			),
			status === 'loading' && el( components.Spinner, null ),
			status === 'error' &&
				el(
					components.Notice,
					{ status: 'error', isDismissible: false },
					__( 'The Radio Browser directory did not answer. Try again in a moment, or paste a station link below.', 'radio-player-72fm' )
				),
			status === 'done' &&
				results.length === 0 &&
				el( 'p', { className: 'radio72fm-empty' }, __( 'No working stations found with that name.', 'radio-player-72fm' ) ),
			results.length > 0 &&
				el(
					'ul',
					{ className: 'radio72fm-results' },
					results.map( function ( station ) {
						return el(
							'li',
							{ key: station.id },
							el(
								components.Button,
								{
									className: 'radio72fm-result',
									onClick: function () {
										props.onSelect( station.id, station.name );
									},
								},
								el( 'span', { className: 'radio72fm-result-name' }, station.name ),
								station.details && el( 'span', { className: 'radio72fm-result-details' }, station.details )
							)
						);
					} )
				),
			el(
				'form',
				{ className: 'radio72fm-paste', onSubmit: applyPasted },
				el( components.TextControl, {
					__nextHasNoMarginBottom: true,
					__next40pxDefaultSize: true,
					label: __( '72fm.com station link or Radio Browser station UUID', 'radio-player-72fm' ),
					value: pasted,
					onChange: function ( value ) {
						setPasted( value );
						setPasteError( false );
					},
					placeholder: 'https://72fm.com/station/…',
				} ),
				el(
					components.Button,
					{ variant: 'secondary', type: 'submit', disabled: pasted.trim() === '', __next40pxDefaultSize: true },
					__( 'Use this station', 'radio-player-72fm' )
				)
			),
			pasteError &&
				el(
					components.Notice,
					{ status: 'warning', isDismissible: false },
					__( 'That is not a 72fm.com station link or a station UUID.', 'radio-player-72fm' )
				),
			props.onCancel &&
				el(
					components.Button,
					{ variant: 'link', onClick: props.onCancel },
					__( 'Keep the current station', 'radio-player-72fm' )
				)
		);
	}

	function Edit( props ) {
		var attributes = props.attributes;
		var setAttributes = props.setAttributes;
		var stationId = parseStationId( attributes.stationId );

		var pickingState = useState( false );
		var picking = pickingState[ 0 ];
		var setPicking = pickingState[ 1 ];

		var blockProps = blockEditor.useBlockProps( { className: 'radio72fm-player' } );

		function onSelect( id, name ) {
			setAttributes( { stationId: id, stationName: name } );
			setPicking( false );
		}

		var inspector = el(
			blockEditor.InspectorControls,
			null,
			el(
				components.PanelBody,
				{ title: __( 'Station', 'radio-player-72fm' ), initialOpen: true },
				el( components.TextControl, {
					__nextHasNoMarginBottom: true,
					__next40pxDefaultSize: true,
					label: __( 'Station name', 'radio-player-72fm' ),
					help: __( 'Used for the player\'s accessible title and the optional link text.', 'radio-player-72fm' ),
					value: attributes.stationName,
					onChange: function ( value ) {
						setAttributes( { stationName: value } );
					},
				} ),
				stationId &&
					el( 'p', { className: 'radio72fm-id' }, sprintf( /* translators: %s: station UUID. */ __( 'Station UUID: %s', 'radio-player-72fm' ), stationId ) )
			),
			el(
				components.PanelBody,
				{ title: __( 'Link to 72FM', 'radio-player-72fm' ), initialOpen: true },
				el( components.ToggleControl, {
					__nextHasNoMarginBottom: true,
					label: __( 'Show a "Listen on 72FM" link below the player', 'radio-player-72fm' ),
					help: __( 'Off by default. When on, your public page shows a visible link to this station\'s page on 72fm.com.', 'radio-player-72fm' ),
					checked: !! attributes.showLink,
					onChange: function ( value ) {
						setAttributes( { showLink: !! value } );
					},
				} )
			)
		);

		if ( ! stationId || picking ) {
			return el(
				'div',
				blockProps,
				inspector,
				el( StationPicker, {
					onSelect: onSelect,
					onCancel: stationId
						? function () {
								setPicking( false );
						  }
						: null,
				} )
			);
		}

		return el(
			'div',
			blockProps,
			inspector,
			el(
				blockEditor.BlockControls,
				null,
				el(
					components.ToolbarGroup,
					null,
					el(
						components.ToolbarButton,
						{
							icon: 'search',
							label: __( 'Change station', 'radio-player-72fm' ),
							onClick: function () {
								setPicking( true );
							},
						},
						__( 'Change station', 'radio-player-72fm' )
					)
				)
			),
			el( PlayerPreview, {
				stationId: stationId,
				stationName: attributes.stationName,
				showLink: !! attributes.showLink,
			} )
		);
	}

	registerBlockType( 'radio-player-72fm/player', {
		edit: Edit,
		save: function () {
			return null;
		},
	} );
} )( window.wp );
