# what is this about?
this is a tinkerforge frontend written in node.js used to 8 control 230V outputs wher i attached different devices like computer displays, lamps and my amplifier.

# relais.js/  
a node.js application running on my raspberry pi. it controls a set of tinkerforge dual relay bricklets using a master brick.

# relais-tool/
since there are no tinkerforge bindings for node.js i came up with a simple c implementation found in relais-tool

you need the tinkerforge c bindings:
  tinkerforge_c_bindings_2_0_11.zip found at http://www.tinkerforge.com/de/doc/Downloads.html

# starting node on boot
chmod 0755 /root/relais.js/starter.sh
type 'crontabe -e' as root and add this line:

    @reboot /root/relais.js/starter.sh

# copyright

* all code is copyrighted AGPL v3, 
  see https://www.gnu.org/licenses/agpl-3.0.html
* some images in public were copied from the oxygen icon set, 
  see http://www.iconarchive.com/show/oxygen-icons-by-oxygen-icons.org.html 

