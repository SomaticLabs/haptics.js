haptics.js
==========

A library for enabling haptic effects on web sites.

# Installation
```javascript
npm install haptics --save
# OR
yarn add haptics
```

The default method is to import Haptics from your module:

```javascript
import { Haptics } from 'haptics'

Haptics.vibrate(100);
```

However, if you don't want to use modules, feel free to load haptics.js in a script tag:
```html
<script type="text/javascript" src="//raw.githubusercontent.com/shantanubala/haptics.js/master/haptics.js"></script>
```