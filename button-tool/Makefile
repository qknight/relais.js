PREFIX=/root/
all: button-tool 

# -std=gnu99 
button-tool: button-tool.c
	gcc -Wall -pthread button-tool.c -o button-tool ${PREFIX}/tinkerforge/bindings/bricklet_io16.c ${PREFIX}/tinkerforge/bindings/ip_connection.c -I ${PREFIX}/tinkerforge/bindings 

clean:
	rm -f button-tool
