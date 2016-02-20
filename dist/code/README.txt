Israel Jones-Alvarez
804050501

Project 3 README:

As always the intricacies of WebGL are one of the biggest problems
with getting everything to work correctly. Especially with getting
all the lighting matrices to work correctly. Well here is what I 
was able to accomplish. 

I got a sphere function that generated a
sphere and had a parameter to control the number of vertices. You
could also alternate between flat and Phong shading by changing the
isFlat bool in the beginning of the program. 

A small solar system was created. The origin of the world is the
eye and the sun was placed some ways away on the z axis. These
planets orbited around the sun at different speeds and with
different diameters and distances from the sun.  The first two
planets have normals calculate from the vertices of each triangle
and the next two have true normals. 

The sun was implemented as a point light source.

I was able to re-use my keyboard based navigation system and iron 
out all the bugs that I had in the last assignment. 

I implemented Phong shading to all the planets. This was very 
difficult because of getting the light location to work correctly.
For a while I had a problem where each of the planets had a "moon"
of light orbiting around them as they were orbiting the sun, which 
made things look wrong. I was able to fix this by separating the
general translations and rotations from the one specific to each 
planet. Then I was able to apply general translation to the light
and the individual translations to the vertex position and this
allowed me to get the shading right.

If you press s it stops the motion of all the planets and if you
press r it resets the camera.

I was also able to implement a moon rotating around the biggest planet.