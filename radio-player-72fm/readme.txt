=== 72FM Radio Player ===
Contributors: alondrilich
Tags: radio, internet radio, player, streaming, embed
Requires at least: 6.3
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Add a live radio station player to any post or page with a block or a shortcode. Stations come from the Radio Browser public directory.

== Description ==

72FM Radio Player puts a small "Listen live" player for one radio station on your site. Pick the station in the block editor by searching for its name, or use the `[radio72]` shortcode.

The player is the free embed from [72FM](https://72fm.com), a web radio player built on the [Radio Browser](https://www.radio-browser.info/) community directory. It appears on your page in an iframe, 168 pixels tall and up to 420 pixels wide.

**What you should know before you use it**

* 72FM does not own, operate, license or curate any radio station. Each station is listed in the Radio Browser directory, and the player plays the broadcaster's own stream, directly from the broadcaster's server.
* Sound quality, programming and any on-air advertising are the broadcaster's, not 72FM's.
* If a broadcaster's stream goes offline, the player says so. Neither this plugin nor 72FM can fix a station's stream.
* The player is loaded from 72fm.com. See "External services" below for exactly what that means for your visitors.

**Features**

* A "72FM Radio Player" block with a station search box (by name) and a live preview in the editor.
* A `[radio72]` shortcode for the classic editor, widgets and page builders.
* An optional "Listen to … on 72FM" link below the player. It is **off unless you turn it on**.
* No settings page, no database tables, no options stored, no cookies set by the plugin, no tracking by the plugin.

**Shortcode**

`[radio72 station="9617a958-0601-11e8-ae97-52543be04c81"]`

`[radio72 station="https://72fm.com/station/9617a958-0601-11e8-ae97-52543be04c81" name="Station name" link="yes"]`

* `station` (required): the station's Radio Browser UUID, or its link on 72fm.com (`https://72fm.com/station/…`). Links to any other website are ignored.
* `name` (optional): the station name. Used for the player's accessible title and for the link text.
* `link` (optional): `yes` shows a "Listen to … on 72FM" link below the player. Leave it out, or use `no`, for no link.

== Installation ==

1. In your dashboard go to Plugins → Add New, search for "72FM Radio Player", then install and activate it. Or upload the `radio-player-72fm` folder to `/wp-content/plugins/` and activate it on the Plugins screen.
2. In the block editor, add the "72FM Radio Player" block (under Embeds), search for a station by name and pick one from the list.
3. Optional: in the block settings sidebar, switch on "Show a 'Listen on 72FM' link below the player".
4. Or, in any shortcode-enabled area, add `[radio72 station="<station UUID or 72fm.com station link>"]`.

== Frequently Asked Questions ==

= Does the plugin add a link to 72FM on my site? =

Not unless you ask for it. The link below the player is off by default. You turn it on with the block's "Show a 'Listen on 72FM' link below the player" switch, or with `link="yes"` in the shortcode. The player itself is served by 72fm.com and shows the station name, a play button and a small "72FM" link to the station's page there.

= Where do I find a station's UUID? =

The easiest way is the block's search box. Otherwise, open the station on [72fm.com](https://72fm.com) and copy the page address (`https://72fm.com/station/…`). You can paste that whole link into the shortcode or the block. Radio Browser UUIDs work too.

= My station is not in the search results. =

The search covers stations listed in the Radio Browser directory that currently pass its stream check. A broadcaster can add or correct its own listing at [radio-browser.info](https://www.radio-browser.info/).

= Does it cost anything? Do I need an account? =

No. The plugin and the 72FM embed are free, and neither you nor your visitors need an account.

= Is 72FM the broadcaster? =

No. 72FM is a player. It does not own or run any station, and it does not host any stream. The audio comes straight from the broadcaster's server.

= The player says the stream is not responding. =

The broadcaster's stream is offline or is refusing the connection. Try again later or pick another station.

= Does the plugin track my visitors? =

The plugin itself collects nothing, stores nothing and sets no cookies. The player it embeds is loaded from 72fm.com; see "External services" for what 72FM receives and records.

== External services ==

This plugin relies on two third-party services. Nothing is sent to either of them when the plugin is merely activated.

**1. 72FM embed player (72fm.com)**

What it is used for: the player itself. Wherever you place the block or the `[radio72]` shortcode, the plugin outputs an iframe that loads `https://72fm.com/embed/<station UUID>`.

When data is sent: every time a visitor views a page that contains the player.

What is sent: the visitor's browser requests the player from 72fm.com, which, like any web request, reveals the visitor's IP address, browser user agent and, depending on the browser's referrer policy, the address of your site. The station UUID is part of the request address.

What happens inside the player:

* The player looks up the station's name, logo and stream address in the Radio Browser directory (see service 2).
* The station logo is loaded from wherever the broadcaster hosts it.
* When the visitor presses "Listen live", the audio is streamed directly from the broadcaster's server, which then sees the visitor's IP address. 72FM does not relay the audio.
* 72FM counts an anonymous view of the player: the event name, the player's address on 72fm.com and a device class (mobile, tablet or desktop). No identifier is attached to it. The count is skipped when the visitor's browser sends a Do Not Track or Global Privacy Control signal.

72FM terms of service: https://72fm.com/terms
72FM privacy policy: https://72fm.com/privacy

**2. Radio Browser API (radio-browser.info)**

What it is used for: finding stations. Radio Browser is a free, community-run directory of internet radio stations. 72FM is not affiliated with it.

When data is sent:

* In the block editor, only when you type a station name and press Search. The request goes from your browser to `de1.api.radio-browser.info` (or, if that does not answer, `de2.api.radio-browser.info` or `all.api.radio-browser.info`). It contains your search words; the plugin sends it without cookies and without a referrer. As with any web request, Radio Browser receives your IP address and browser user agent.
* On the public site, the 72FM player (not the plugin) asks the Radio Browser API for the station's details, as described above.

Radio Browser website: https://www.radio-browser.info/
Radio Browser API documentation: https://api.radio-browser.info/
At the time of writing, Radio Browser does not publish separate terms of service or a privacy policy; its website and API documentation are the published information about the service.

== Screenshots ==

1. The block in the editor: search the Radio Browser directory by station name and pick a station.
2. The player on the public site, with the optional "Listen on 72FM" link switched on.

== Changelog ==

= 1.0.0 =
* First release: "72FM Radio Player" block with station search, `[radio72]` shortcode, optional link to 72FM (off by default).

== Upgrade Notice ==

= 1.0.0 =
First release.
