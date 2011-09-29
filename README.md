# Whatajong

This is an example of an html5 multiplayer game with nodejs and socket.io.

![](https://github.com/masylum/whatajong/raw/master/public/images/preview.png)

## Installation

```bash
git clone https://github.com/masylum/whatajong.git
npm install
cp default.conf.js conf.js
```

Edit the `conf.js` file with your specific configuration and you are ready to go!

## How does it work?

Half the game work in the client, and the other half in the server.
Both parts are communciated via socket.io exchanging `events` and `state`.

```
.-----------.                   .-------------.
| Server    |                   | Browser 1   |
+-----------+                   +-------------+
|           |                   |             |
|           | <=== Events ======| public/js/* |
|           |                   |             |
|           |                   '-------------'
|           |
| serverjs  |===== State (broadcast) ====>
|           |
|           |                   .-------------.
|           |                   | Browser n   |
|           |                   +-------------+
|           |                   |             |
|           | <=== Ecents ======| public/js/* |
|           |                   |             |
'-----------'                   '-------------'
```
