# Somnkarta

For any pair of sunset and sunrise times less than a day apart, there exists
a point on the Earth where the sun set and rose at those times.
If I slept when the sun set and woke when the sun rose, where in the
world would I be each night? That is the question this project intends
to answer using the sleep data I've kept (almost) every night since the
beginning of summer break 2014.

somnkarta.html demonstrates. 

This project uses three JavaScript APIs.
* The [Google Visualization API](https://developers.google.com/chart/interactive/docs/reference)
* [jQuery Mapael API](https://github.com/neveldo/jQuery-Mapael) 
* [jQuery-UI](https://github.com/jquery/jquery-ui)

## NOTICE - Licensing stuff
This project makes use of the Google Charts API, which binds me and end users to their 
EULA: https://developers.google.com/terms/

It also uses the [jQuery Mapael project](https://github.com/neveldo/jQuery-Mapael) 
which is under the BSD 2 License. The jQuery-Mapael code and its license is in a
 submodule.

[jQuery-UI](https://github.com/jquery/jquery-ui) is the other submodule and it 
uses an MIT license as best as I can tell.

It also uses  

Unless otherwise specified, anything outside those submodules was written by me.

For the git user less experienced with submodules: 
After cloning this repository, also run 

```git submodule update --init --recursive```

to clone the contents of submodules.
