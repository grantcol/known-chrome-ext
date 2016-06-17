## Installation

_(via [the chrome extension docs](https://developer.chrome.com/extensions/getstarted#unpacked))_

1. Visit chrome://extensions (via omnibox or menu -> Tools -> Extensions).
2. Enable Developer mode by ticking the checkbox in the upper-right corner.
3. Click on the "Load unpacked extension..." button.
4. Select the directory containing your unpacked extension. 

## Usage 

Sign into your trakfire account with your **twitter** handle and **trakfire** password. On first sign in the system will take the password you give give and set that for future authentication. From there the posting process is exactly the same as on the web platform at www.trakfire.com

## Dev Mode
line 2 of popup.js will show whether the app is built for dev or stage/prod
`var dev = true;`
change this to `false` when you are ready to post to **the staging server**. 
