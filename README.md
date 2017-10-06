# Somnkarta

For any pair of sunset and sunrise times less than a day apart, there (usually)
exists a point on the Earth where the sun set and rose at those times.
If I slept when the sun set and woke when the sun rose, where in the
world would I be each night? That is the question this project intends
to answer using the sleep data I've kept (almost) every night since the
beginning of summer break 2014.

somnkarta.html traces my path through the Earth.
Demos/Demo.html demonstrates some aspects of the algorithm involved.

## A Sad Truth

Near the Equinoxes in March and September, the duration of the night approaches
uniformity across latitudes and it becomes impossible to find points
on the Earth whose sunrise and sunset times are too close or too far apart.

In somnkarta.html, we ignore those days, so there will be second-long pauses
and a message to the console. If you have a better idea, let me know.

In sun.html, the inverse_riseset function will keep attempting to find the
point and will return a point whose latitude and longitude are outside
the bounds of the Earth. So be careful if you use it.

## NOTICE - Licensing stuff
This project uses three JavaScript APIs.
* The [Google Visualization API](https://developers.google.com/chart/interactive/docs/reference)
..* See their [EULA](https://developers.google.com/terms/) 
* [jQuery Mapael API](https://github.com/neveldo/jQuery-Mapael)
..* BSD 2 License 
* [jQuery-UI](https://github.com/jquery/jquery-ui)
..* MIT License (As best as I can tell)

Icons are from iconfinder
* [Menu icon](https://www.iconfinder.com/icons/216511/menu_icon#size=128)
* [All other icons](https://www.iconfinder.com/Sakagami)

Unless otherwise specified, anything outside those submodules was written by me.

## Cloning Submodules
For the git user less experienced with submodules: 
After cloning this repository, also run 

```git submodule update --init --recursive```

to clone the contents of submodules.
