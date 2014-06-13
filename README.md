sleep-server
============

It's easy to wake your computer with [Wake-On-Lan](http://en.wikipedia.org/wiki/Wake-on-LAN)

Now you can send your computer back to sleep via HTTP

### Install 

```
npm install -g sleep-server
```

### Help

```
  Usage: sleep-server [options]

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -p, --port <port>  Port to run server on (default: 57339)
    -H, --host <host>  Interface to run server on (default: 0.0.0.0)
    -u, --url <url>    URL to trigger sleep (default: sleep)
    -w, --wait <ms>    Wait in milliseconds before sleeping (default: 3000)
    -d, --daemonize    Daemonize the sleep server and send output to a file (default: log.txt)
```

### Example

Host A
```sh
$ sleep-server
Listening for sleep requests at http://0.0.0.0:57339/sleep
```

Host B
```sh
$ curl http://host-a:57339/sleep...
ok
```

Host A
```
#1:
  Sleeping in 1000ms
  Time: Fri Jun 13 2014 22:32:47 GMT+1000 (EST)
  IP address: 10.0.0.1
```

Then when you wake the Host A...

Host A
```
#2:
  Woke
  Time: Fri Jun 13 2014 22:36:15 GMT+1000 (EST)
```

#### MIT License

Copyright &copy; 2014 Jaime Pillora &lt;dev@jpillora.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.