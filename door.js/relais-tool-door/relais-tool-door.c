/*
 *   relais-tool-door sets the relais 0 to true for 4000ms or something like that
 *
 *   Copyright (C) 2016 Joachim Schiele
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

// http://www.tinkerforge.com/en/doc/Software/Bricklets/DualRelay_Bricklet_C.html#dual-relay-bricklet-c-examples

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
             UID = "A75";
             break;
          case 2:        
          case 3:        
             UID = "A75";
             break;
          case 4:        
          case 5:        
             UID = "A75";
             break;
          case 6:        
          case 7:        
             UID = "A75";
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
        // ret is pretty useless... 
        ret = dual_relay_set_monoflop(&dr, 1, true, 4000);

	ipcon_destroy(&ipcon); // Calls ipcon_disconnect internally

        return ret;
}

void usage(char* p) {
             printf("usage: '%s open' to trigger the relais for a few seconds\n", p);
}

int main(int argc, char* argv[]) {
        if (argc == 2) {
          //printf("%s\n", argv[1]); 
           if (strcmp(argv[1], "open") != 0) {
             usage(argv[0]);
             return -1;
           }
        } else {
             usage(argv[0]);
             return -1;
        }

        int n = status_query(0,0); // 0,0 is a hack, we only ever trigger relais 0
        if (n == 0 || n == 1) 
          printf("%i\n", n); 
          return 0;
        // error happended
        return 1;
}
