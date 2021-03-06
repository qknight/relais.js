/*
 *   relais-tool gets/sets the status of a tinkerforge master brick / dual relais bricklet
 *
 *   Copyright (C) 2014 Joachim Schiele
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Affero General Public License as
 *   published by the Free Software Foundation, version 3 of the License.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Affero General Public License for more details.
 *
 *   You should have received a copy of the GNU Affero General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
#include <stdio.h>

#include "ip_connection.h"
#include "bricklet_dual_relay.h"

#define HOST "localhost"
#define PORT 4223

// return -1 on errror
// returns queried or new state if new state was set successfully
int status_query(int r, int s) {
	// Create IP connection
	IPConnection ipcon;
	ipcon_create(&ipcon);
        char* UID;

        int ret = -1;

        switch(r) {
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
	   fprintf(stderr, "r is limitted to r<8\n");
           return -1;
        }

	// Create device object
	DualRelay dr;
	dual_relay_create(&dr, UID, &ipcon); 

	// Connect to brickd
	if(ipcon_connect(&ipcon, HOST, PORT) < 0) {
		fprintf(stderr, "Could not connect\n");
                return -1;
	}
	// Don't use device before ipcon is connected

        bool ret_relay0;
        bool ret_relay1;
        ret = dual_relay_get_state(&dr, &ret_relay0, &ret_relay1);
        if (ret != 0) {
                fprintf(stderr, "return value of dual_relay_get_state = %i\n", ret);
                return -1;
        }
        
        if (s == -1) {
          //printf("s == -1\n");
          if (r%2 == 0) {
            //printf("%i\n", ret_relay0); 
            ret = ret_relay0;
          } else {
            //printf("%i\n", ret_relay1);
            ret = ret_relay1;
          }
        } else {
          //printf("s != -1\n");
          if (r%2 == 0) {
	    if (dual_relay_set_state(&dr, s, ret_relay1) == 0)
              ret = s;
          } else {
	    if (dual_relay_set_state(&dr, ret_relay0, s) == 0)
              ret = s;
          }
        }
	ipcon_destroy(&ipcon); // Calls ipcon_disconnect internally

        return ret;
}

int main(int argc, char* argv[]) {
        if (argc == 1) {
            // ./relais-tool with no arguments to return JSON which contains
            // the configuration for the selected relais
            fprintf(stderr, "state of all relays\n");
            int arr[8];
            for (int i=0; i < 6; ++i) {
               int state = status_query(i,-1);
               if (state == -1) {
                 fprintf(stderr, "error reading all from all relays, maybe not connected via usb?\n");
                 return 1;
               }
               arr[i] = state;
            }
            printf("{ \"data\" : [ "); 
            for (int i=0; i < 6; ++i) {
               if (i > 0)
                 printf(",");
               printf("{\"value\" : \"%i\"}", arr[i]);
            }
            printf(" ] }\n");
            return 0;
        } else if (argc == 2 || argc == 3) {
           // on argc == 2    query one relais, return the value
           // not used for relais.js but handy to check the state on the shell for debugging
           int r = atoi(argv[1]);

           int s = -1;
           // on argc == 3    set the relay r to state s
           // used in relais.js
           if (argc == 3) 
             s = atoi(argv[2])%2;

           int n = status_query(r, s);
           if (n == 0 || n == 1) 
             printf("%i\n", n); 
             return 0;
        } 
        // error happended
        return 1;
}
