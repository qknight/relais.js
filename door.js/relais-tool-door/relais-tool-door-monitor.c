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
void usage(char* p) {
	printf("usage: '%s open' to trigger the relais for a few seconds\n", p);
}

void my_callback(int p, void *user_data) {
    fprintf(stdout, "{ \"data\" : \"door_buzz_end\" } \n");
    fflush(stdout);
}

int main(int argc, char* argv[]) {
//        if (argc == 2) {
//          //printf("%s\n", argv[1]); 
//           if (strcmp(argv[1], "open") != 0) {
//             usage(argv[0]);
//             return -1;
//           }
//        } else {
//             usage(argv[0]);
//             return -1;
//        }
//

	IPConnection ipcon;
	ipcon_create(&ipcon);
        char* UID;
        UID = "A75";

        int ret = -1;

	// Create device object
	DualRelay dr;
	dual_relay_create(&dr, UID, &ipcon); 

	// Connect to brickd
	if(ipcon_connect(&ipcon, HOST, PORT) < 0) {
		fprintf(stderr, "Could not connect\n");
                return -1;
	}

        // Register callback for interrupts
        dual_relay_register_callback(&dr, DUAL_RELAY_CALLBACK_MONOFLOP_DONE, (void *)my_callback, NULL);

        fprintf(stderr, "Press key to exit\n");
        getchar();
        ipcon_destroy(&ipcon); // Calls ipcon_disconnect internally
        ret = 0;
        return ret;

}
