/*
 *   keypad-tool gets the status of a tinkerforge multi touch bricklet
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
#include "bricklet_multi_touch.h"

#define HOST "localhost"
#define PORT 4223
#define UID "iKr" // Change to your UID

// Callback function for touch_state 
void cb_touch_state(uint16_t touch_state, void *user_data) {
    (void)user_data; // avoid unused parameter warning

    if(touch_state & (1 << 12)) {
        ;//printf("In proximity, ");
    }

    if((touch_state & 0xfff) == 0) {
        ;//printf("No electrodes touched\n\n");
    } else {
        //printf("Electrodes ");
        int i = 0;
        for(; i < 12; i++) {
            if(touch_state & (1 << i)) {
                fprintf(stdout, "{ \"data\" : \"%d\" } \n", i);
                fflush(stdout);
            }
        }
        //printf("touched\n\n");
    }
}

int main() {
    // Create IP connection
    IPConnection ipcon;
    ipcon_create(&ipcon);

    // Create device object
    MultiTouch mt;
    multi_touch_create(&mt, UID, &ipcon); 

    // Connect to brickd
    if(ipcon_connect(&ipcon, HOST, PORT) < 0) {
        fprintf(stderr, "Could not connect\n");
        exit(1);
    }
    // Don't use device before ipcon is connected

    // Register touch_state callback to function cb_touch_state
    multi_touch_register_callback(&mt,
                                  MULTI_TOUCH_CALLBACK_TOUCH_STATE,
                                  (void *)cb_touch_state,
                                  NULL);

    fprintf(stderr, "Press key to exit\n");
    getchar();
    ipcon_destroy(&ipcon); // Calls ipcon_disconnect internally
}
