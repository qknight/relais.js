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
#include "bricklet_io16.h"

#define HOST "localhost"
#define PORT 4223
#define UID "gpA" // Change to your UID

#include <stdio.h>      /* printf */
#include <string.h>     /* strcat */
#include <stdlib.h>     /* strtol */

const char *byte_to_binary(int x)
{
    static char b[9];
    b[0] = '\0';

    int z;
    for (z = 128; z > 0; z >>= 1)
    {
        strcat(b, ((x & z) == z) ? "1" : "0");
    }

    return b;
}

// Callback function for interrupts
void cb_interrupt(char port, uint8_t interrupt_mask, uint8_t value_mask, void *user_data) {
    (void)user_data; // avoid unused parameter warning
    int b = 0;

    //fprintf(stderr, "Interrupt on port: %c\n", port);
    //fprintf(stderr, "Interrupt by: %s %d\n", byte_to_binary(interrupt_mask),interrupt_mask);
    //fprintf(stderr, "Value: %s %d\n", byte_to_binary(value_mask), value_mask);

    switch(interrupt_mask) {
      case 1:
        b = 7;
        break;
      case 2:
        b = 6;
        break;
      case 4:
        b = 5;
        break;
      case 8:
        b = 4;
        break;
      case 16:
        b = 3;
        break;
      case 32:
        b = 2;
        break;
      case 64:
        b = 1;
        break;
      case 128:
        b = 0;
        break;
    }

    if ((value_mask & interrupt_mask) == 0)
      fprintf(stdout, "{ \"data\" : \"%d\" } \n", b);
    fflush(stdout);
}

int main() {
    // Create IP connection
    IPConnection ipcon;
    ipcon_create(&ipcon);

    // Create device object
    IO16 io;
    io16_create(&io, UID, &ipcon); 

    // Connect to brickd
    if(ipcon_connect(&ipcon, HOST, PORT) < 0) {
        fprintf(stderr, "Could not connect\n");
        exit(1);
    }
    // Don't use device before ipcon is connected

    // Register callback for interrupts
    io16_register_callback(&io,
                           IO16_CALLBACK_INTERRUPT,
                           (void *)cb_interrupt,
                           NULL);

    // Enable interrupt on pin 2 of port a
    io16_set_port_interrupt(&io, 'a', 255);

    fprintf(stderr, "Press key to exit\n");
    getchar();
    ipcon_destroy(&ipcon); // Calls ipcon_disconnect internally
    return 0;
}
