# Option A - Home Assistant Container

The above template includes a configuration that allows a user to use the Home Assistant container rather than relying on the Home Assistant OS.

This allows the system to be utilized by a lower processing unit (Home Assistant OS req >2GB memory) and be run on a Raspberry PI 3.


The difference is that the system utilizes the web API that the NLE Standalone Docker container exposes and brings it into the climate template. Further APIs and states are available but this is a bare minimum configuration.

## Installation

Follow the [Option B](https://docs.nolongerevil.com/self-hosted/installation#option-b-—-standalone-docker) installation on your server.

This can be added to either the home assistant container or OS. This was intended as an option for the [container](https://www.home-assistant.io/installation/#use-a-container-or-virtual-machine).


Update your configuration.yaml with the included file contents after updating the server ip ("< your_standalone_server_ip >") and nest serial ("< first thermostat serial >"). The serial can be found on the NLE Standalone server GUI. 


The sensors and entity "First Thermostat" will be made available for a dashboard ender the "Climate" section.

