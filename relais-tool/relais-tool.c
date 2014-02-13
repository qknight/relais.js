
#include <stdio.h>

#include "ip_connection.h"
#include "bricklet_dual_relay.h"

#define HOST "localhost"
#define PORT 4223

int main(int argc, char* argv[]) {
	// Create IP connection
	IPConnection ipcon;
	ipcon_create(&ipcon);
        char* UID;

        if (argc == 1) {
            printf("state of all relays\n");
            exit(0);
        }

        int r = atoi(argv[1])%2;
        int ret = 0;


        switch(atoi(argv[1])) {
          case 0:        
          case 1:        
             UID = "brkA";
             break;
          case 2:        
          case 3:        
             UID = "brkB";
             break;
          case 4:        
          case 5:        
             UID = "brkC";
             break;
          case 6:        
          case 7:        
             UID = "brkD";
             break;
          default:
           exit(1);
        }

        
	// Create device object
	DualRelay dr;
	dual_relay_create(&dr, UID, &ipcon); 

	// Connect to brickd
	if(ipcon_connect(&ipcon, HOST, PORT) < 0) {
		fprintf(stderr, "Could not connect\n");
                return 1;
	}
	// Don't use device before ipcon is connected

	// Turn relay 1 on and relay 2 off.
        bool ret_relay0;
        bool ret_relay1;
        ret = dual_relay_get_state(&dr, &ret_relay0, &ret_relay1);
        //if (ret != 1)
        //        return 1;
        
        if (argc == 2) {
          if (r == 0)
            printf("%i\n", ret_relay0); 
          else
            printf("%i\n", ret_relay1);
        } else {
          if (r == 0)
	    ret = dual_relay_set_state(&dr, atoi(argv[2]), ret_relay1);
          else 
	    ret = dual_relay_set_state(&dr, ret_relay0, atoi(argv[2]));
        }
	ipcon_destroy(&ipcon); // Calls ipcon_disconnect internally

        //if (ret != 1)
        //        return 1;
        return 0;
}
