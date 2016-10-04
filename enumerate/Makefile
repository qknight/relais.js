PREFIX=/root/
all: example_enumerate

# -std=gnu99 
example_enumerate: example_enumerate.c
	gcc -Wall -pthread example_enumerate.c -o example_enumerate ${PREFIX}/tinkerforge/bindings/bricklet_io16.c ${PREFIX}/tinkerforge/bindings/ip_connection.c -I ${PREFIX}/tinkerforge/bindings 

clean:
	rm -f example_enumerate
