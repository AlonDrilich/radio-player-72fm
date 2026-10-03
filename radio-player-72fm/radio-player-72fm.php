<?php
/**
 * Plugin Name:       72FM Radio Player
 * Plugin URI:        https://72fm.com/for-broadcasters
 * Description:       Embed a live radio station player from 72FM with a shortcode or a block. Stations come from the Radio Browser public directory.
 * Version:           1.0.2
 * Requires at least: 6.3
 * Requires PHP:      7.4
 * Author:            72FM
 * Author URI:        https://72fm.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       radio-player-72fm
 *
 * @package Radio_Player_72FM
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Pull a Radio Browser station UUID out of whatever the user pasted.
 *
 * Accepts a bare UUID, or a link on 72fm.com such as
 * https://72fm.com/station/<uuid> or https://72fm.com/embed/<uuid>.
 * Links to any other host are rejected rather than guessed at.
 *
 * @param mixed $input Raw station value from a shortcode or block attribute.
 * @return string Lower-case UUID, or an empty string when nothing valid was found.
 */
function radio72fm_parse_station_id( $input ) {
	if ( ! is_scalar( $input ) ) {
		return '';
	}

	$input = trim( (string) $input );
	if ( '' === $input || strlen( $input ) > 300 ) {
		return '';
	}

	$uuid = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

	if ( preg_match( '/^' . $uuid . '$/', $input ) ) {
		return strtolower( $input );
	}

	// "72fm.com/station/…" pasted without the scheme.
	if ( preg_match( '#^(?:www\.)?72fm\.com/#i', $input ) ) {
		$input = 'https://' . $input;
	}

	$host = wp_parse_url( $input, PHP_URL_HOST );
	$path = wp_parse_url( $input, PHP_URL_PATH );
	if ( ! is_string( $host ) || ! is_string( $path ) ) {
		return '';
	}

	$host = strtolower( $host );
	if ( '72fm.com' !== $host && 'www.72fm.com' !== $host ) {
		return '';
	}

	if ( preg_match( '#^/(?:station|embed)/(' . $uuid . ')/?$#', $path, $matches ) ) {
		return strtolower( $matches[1] );
	}

	return '';
}

/**
 * Build the player markup.
 *
 * @param string $station_id   A UUID already validated by radio72fm_parse_station_id().
 * @param string $station_name Station name, used for the iframe title and the optional link text.
 * @param bool   $show_link    Whether to print the "Listen to … on 72FM" link. Off unless the site owner turns it on.
 * @return string HTML.
 */
function radio72fm_player_html( $station_id, $station_name = '', $show_link = false ) {
	$station_name = trim( sanitize_text_field( $station_name ) );

	$embed_url   = 'https://72fm.com/embed/' . rawurlencode( $station_id );
	$station_url = 'https://72fm.com/station/' . rawurlencode( $station_id );

	if ( '' !== $station_name ) {
		/* translators: %s: radio station name. */
		$title = sprintf( __( '%s — live radio player', 'radio-player-72fm' ), $station_name );
		/* translators: %s: radio station name. */
		$link_text = sprintf( __( 'Listen to %s on 72FM', 'radio-player-72fm' ), $station_name );
	} else {
		$title     = __( 'Live radio player', 'radio-player-72fm' );
		$link_text = __( 'Listen to this station on 72FM', 'radio-player-72fm' );
	}

	$html = sprintf(
		'<iframe src="%1$s" width="100%%" height="168" style="border:0;border-radius:12px;max-width:420px;display:block" loading="lazy" title="%2$s"></iframe>',
		esc_url( $embed_url ),
		esc_attr( $title )
	);

	if ( $show_link ) {
		$html .= sprintf(
			'<p class="radio72fm-link" style="font:13px system-ui,sans-serif;margin:8px 0 0"><a href="%1$s">%2$s</a></p>',
			esc_url( $station_url ),
			esc_html( $link_text )
		);
	}

	return $html;
}

/**
 * What an editor sees when the station value is missing or unreadable.
 * Visitors get nothing, so a typo never shows a broken box on the public site.
 *
 * @return string HTML.
 */
function radio72fm_invalid_station_notice() {
	if ( ! current_user_can( 'edit_posts' ) ) {
		return '';
	}

	return '<p class="radio72fm-notice">' . esc_html__( '72FM Radio Player: add a station — a Radio Browser station UUID or a 72fm.com station link. (Only editors see this message.)', 'radio-player-72fm' ) . '</p>';
}

/**
 * Whether a shortcode flag such as link="yes" is switched on.
 *
 * @param mixed $value Raw attribute value.
 * @return bool
 */
function radio72fm_is_truthy( $value ) {
	if ( is_bool( $value ) ) {
		return $value;
	}
	return in_array( strtolower( trim( (string) $value ) ), array( '1', 'yes', 'true', 'on' ), true );
}

/**
 * Shortcode: [radio72 station="<uuid or 72fm.com station link>" name="Station name" link="yes"]
 *
 * The link to 72fm.com below the player is printed only when link="yes" is given.
 *
 * @param array|string $atts Shortcode attributes.
 * @return string HTML.
 */
function radio72fm_shortcode( $atts ) {
	$atts = shortcode_atts(
		array(
			'station' => '',
			'name'    => '',
			'link'    => 'no',
		),
		$atts,
		'radio72'
	);

	$station_id = radio72fm_parse_station_id( $atts['station'] );
	if ( '' === $station_id ) {
		return radio72fm_invalid_station_notice();
	}

	return '<div class="radio72fm-player">' . radio72fm_player_html( $station_id, $atts['name'], radio72fm_is_truthy( $atts['link'] ) ) . '</div>';
}
add_shortcode( 'radio72', 'radio72fm_shortcode' );

/**
 * Server-side render for the block. Same output as the shortcode.
 *
 * @param array $attributes Block attributes.
 * @return string HTML.
 */
function radio72fm_render_block( $attributes ) {
	$station_id = radio72fm_parse_station_id( isset( $attributes['stationId'] ) ? $attributes['stationId'] : '' );
	if ( '' === $station_id ) {
		return radio72fm_invalid_station_notice();
	}

	$name      = isset( $attributes['stationName'] ) && is_string( $attributes['stationName'] ) ? $attributes['stationName'] : '';
	$show_link = isset( $attributes['showLink'] ) && true === $attributes['showLink'];

	return sprintf(
		'<div %1$s>%2$s</div>',
		get_block_wrapper_attributes( array( 'class' => 'radio72fm-player' ) ),
		radio72fm_player_html( $station_id, $name, $show_link )
	);
}

/**
 * Register the block from block.json.
 */
function radio72fm_register_block() {
	register_block_type(
		__DIR__ . '/block',
		array(
			'render_callback' => 'radio72fm_render_block',
		)
	);
}
add_action( 'init', 'radio72fm_register_block' );
