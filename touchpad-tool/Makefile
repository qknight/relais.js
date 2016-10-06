PREFIX=/root/
all: keypad-tool 

keypad-tool: keypad-tool.c
	gcc -std=gnu99 -Wall -pthread keypad-tool.c -o keypad-tool ${PREFIX}/tinkerforge/bindings/bricklet_multi_touch.c ${PREFIX}/tinkerforge/bindings/ip_connection.c -I ${PREFIX}/tinkerforge/bindings 

clean:
	rm -f keypad-tool
