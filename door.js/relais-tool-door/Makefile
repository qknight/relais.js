PREFIX=/root/
all: relais-tool-door.c relais-tool-door-monitor.c
	gcc -std=gnu99 -Wall -pthread relais-tool-door.c -o relais-tool-door ${PREFIX}/tinkerforge/bindings/bricklet_dual_relay.c ${PREFIX}/tinkerforge/bindings/ip_connection.c -I ${PREFIX}/tinkerforge/bindings 
	gcc -std=gnu99 -Wall -pthread relais-tool-door-monitor.c -o relais-tool-door-monitor ${PREFIX}/tinkerforge/bindings/bricklet_dual_relay.c ${PREFIX}/tinkerforge/bindings/ip_connection.c -I ${PREFIX}/tinkerforge/bindings 
clean:
	rm -f relais-tool-door
	rm -f relais-tool-door-monitor
