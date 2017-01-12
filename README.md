# teledraw2
A web app to play the game Teledraw

## How to run it:

In this directory, do

`docker build -t teledraw2 .`

Now you'll have a docker image tagged as "teledraw2." To run it interactively with the proper port exposed, do:

`docker run -it -p 3000:3000 teledraw2`
