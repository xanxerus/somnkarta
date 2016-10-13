# Somnkarta
If I slept when the sun set and woke when the sun rose, where in the 
world would I be each night? That is the question this project intends 
to answer using the sleep data I've kept (almost) every night since the
beginning of summer break 2014.

At present, this is only a work in progress, since neither the frontend
nor the backend are currently on this repo.

I originally intended to do this project in Python, but I have found
Python's map APIs lacking. Instead, this project will be done in 
JavaScript using the [Google Visualization API](https://developers.google.com/chart/interactive/docs/reference), 
[suncalc](https://github.com/mourner/suncalc), 
and [JQuery Mapael API](https://github.com/neveldo/jQuery-Mapael) for 
querying data, calculating positions, and displaying a map visual respectively. 

## NOTICE - Licensing stuff
This project makes use of the [jQuery Mapael project](https://github.com/neveldo/jQuery-Mapael) 
which is under the MIT License and [suncalc](https://github.com/mourner/suncalc) 
which is under the BSD 2 License.

The code borrowed from those projects are in this repo as submodules along with their licenses.

Unless otherwise specified, anything outside those submodules was written by me.

For the unexperienced git user: after cloning this repository, also run 
```git submodule update --init --recursive```
to clone the contents of submodules.
