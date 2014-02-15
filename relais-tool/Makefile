PREFIX=/root/
all: relais-tool.c
	gcc -std=gnu99 -Wall -pthread relais-tool.c -o relais-tool ${PREFIX}/tinkerforge/bindings/bricklet_dual_relay.c ${PREFIX}/tinkerforge/bindings/ip_connection.c -I ${PREFIX}/tinkerforge/bindings 
clean:
	rm -f relais-tool
