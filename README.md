attach-script
=============

Event-driven user script support library.

Usage
-----

The entire premise of this is to be as flexible and simple as possible, so for setting up:

    var attachScript = require('attachScript');
    attachScript.listen($(document), 'userscripts');
    window.attachScript = attachScript.attachScript();

And for userscripts, all they need to do is

    attachScript(function(ext){ 
      console.log('Hello from userscript land!');
    });

And to fire your userscripts when you're ready (don't worry, if their JS gets loaded late, it'll immediately call after this!)
  
    $(document).trigger('userscripts');

And voila. They're running!

Advanced Usage
--------------

You may also set your events to fire only specific user scripts using "wants." The userscript would be set up in one of two ways, shown below.

    attachScript('want0', function(){...

or for multiple wants,

    attachScript(['want0', 'other'], function(){...

and in your code, all you need to do is trigger the event with the want as extra data.

    $(document).trigger('userscripts', 'other');

**Note:** If you use the want `*` or leave the want arg out, the user script will run after the first triggered want.
