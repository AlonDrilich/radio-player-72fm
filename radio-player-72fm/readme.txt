=== 72FM Radio Player ===
Contributors: alondrilich
Tags: radio, internet radio, player, streaming, embed
Requires at least: 6.3
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.2
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
* A few stations only offer an unsecured (`http://`) stream. Browsers will not play those inside a page served over HTTPS, so on an HTTPS site the player first tries the `https://` form of the address and, if that does not work, says so and links to the station's page on 72FM.
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

= The player says the station only offers an unsecured stream. =

Some stations only publish an `http://` stream address. A browser will not play that inside a page served over HTTPS. The player first tries the `https://` form of the address; if the station does not answer there, it says so and links to the station's page on 72FM. Pick another station, or ask the broadcaster to offer an `https://` stream.

= The player says the stream is not responding. =

The broadcaster's stream is offline or is refusing the connection. Try again later or pick another station.

= Does the plugin track my visitors? =

The plugin itself collects nothing, stores nothing and sets no cookies. The player it embeds is loaded from 72fm.com, whose hosting platform records each view and may set a session cookie for 30 minutes inside the player; see "External services" for exactly what is recorded. If you need your pages to load nothing from a third party, do not use the embed.

== External services ==

This plugin relies on three third-party services (72FM's own embed server, the Radio Browser directory, and the database host that stores 72FM's anonymous view count). Nothing is sent to any of them when the plugin is merely activated.

**1. 72FM embed player (72fm.com)**

What it is used for: the player itself. Wherever you place the block or the `[radio72]` shortcode, the plugin outputs an iframe that loads `https://72fm.com/embed/<station UUID>`.

When data is sent: every time a visitor views a page that contains the player.

What is sent: the visitor's browser requests the player from 72fm.com, which, like any web request, reveals the visitor's IP address, browser user agent and, depending on the browser's referrer policy, the address of your site. The station UUID is part of the request address.

What happens inside the player:

* The player looks up the station's name, logo and stream address in the Radio Browser directory (see service 2).
* The station logo is loaded from wherever the broadcaster hosts it.
* When the visitor presses "Listen live", the audio is streamed directly from the broadcaster's server, which then sees the visitor's IP address. 72FM does not relay the audio.
* The player records one anonymous "embed view" per load: the station id and a device class (mobile, tablet or desktop), with no cookie and no identifier attached, in 72FM's own database (see service 3). It is skipped when the visitor's browser sends a Global Privacy Control or Do Not Track signal. The player sends no page-view or session events, and does not relay the audio: the station's stream plays directly from the broadcaster's server.
* 72fm.com is hosted on Lovable, and the hosting platform runs its own visitor analytics on every page it serves, the player included. For each view it records the visitor's browser user agent and language, a guess at their country from their time zone, the address of the player and, depending on the browser's referrer policy, the page it was shown on, and it keeps a random session id for 30 minutes in a cookie or in the browser's storage. It does not honour Do Not Track or Global Privacy Control. If your privacy policy lists the services your pages load, add the embedded player to it.

72FM terms of service: https://72fm.com/terms
72FM privacy policy: https://72fm.com/privacy

**2. Radio Browser API (radio-browser.info)**

What it is used for: finding stations. Radio Browser is a free, community-run directory of internet radio stations. 72FM is not affiliated with it.

When data is sent:

* In the block editor, only when you type a station name and press Search. The request goes from your browser to `de1.api.radio-browser.info` (or, if that does not answer, `de2.api.radio-browser.info` or `all.api.radio-browser.info`). It contains your search words; the plugin sends it without cookies and without a referrer. As with any web request, Radio Browser receives your IP address and browser user agent.
* On the public site, the 72FM player (not the plugin) asks the Radio Browser API for the station's details, as described above, so Radio Browser also receives the visitor's IP address and browser user agent. The station logo is loaded from the broadcaster's own host, which sees them too.

Radio Browser website: https://www.radio-browser.info/
Radio Browser API documentation: https://api.radio-browser.info/
At the time of writing, Radio Browser does not publish separate terms of service or a privacy policy; its website and API documentation are the published information about the service.

**3. Supabase (supabase.co), 72FM's database host**

What it is used for: storing the anonymous embed-view count described above.

When data is sent: every time a visitor loads a page that contains the player (unless the visitor's browser sends a Global Privacy Control or Do Not Track signal). The request goes from the visitor's browser to 72FM's database project on supabase.co, which, like any web request, reveals the visitor's IP address and browser user agent to that host. 72FM's table stores the station id and the device class, not the IP address.

Supabase terms: https://supabase.com/terms
Supabase privacy policy: https://supabase.com/privacy

== Screenshots ==

1. The block in the editor: search the Radio Browser directory by station name and pick a station.
2. The player on the public site, with the optional "Listen on 72FM" link switched on.

== Changelog ==

= 1.0.2 =
* Readme correction: the embedded player does record one anonymous embed view per load (station id and device class, no identifier) in 72FM's own database on Supabase; Supabase is now listed as a third service, and the readme says that Radio Browser and the logo's host also see the visitor's IP address.

= 1.0.1 =
* The readme now describes exactly what the embedded player and its host record (hosting-platform analytics, session cookie), and explains the message shown for stations that only offer an unsecured stream.

= 1.0.0 =
* First release: "72FM Radio Player" block with station search, `[radio72]` shortcode, optional link to 72FM (off by default).

== Upgrade Notice ==

= 1.0.2 =
Documentation correction about what the embedded player records. No functional change in the plugin.

= 1.0.1 =
Documentation update: corrects the description of what the embedded player records. No functional change in the plugin.

= 1.0.0 =
First release.
