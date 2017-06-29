'''
The MIT License (MIT)
Copyright (c) 2013 Dave P.
'''

import signal
import sys
import ssl
from SimpleWebSocketServer import WebSocket, SimpleWebSocketServer, SimpleSSLWebSocketServer
from optparse import OptionParser
import json

clients = []

class SimpleEcho(WebSocket):

   def handleMessage(self):
       tab_data = json.loads(self.data)
       # import ipdb; ipdb.set_trace();
       print(tab_data)
       for client in clients:
          if client.__dict__ != self.__dict__:
              client.sendMessage(self.data)

   def handleConnected(self):
       print("{0} connected!".format(self.address))
       for client in clients:
           client.sendMessage("\{ 'kind' : 'update_connect', 'payload' : 'Look who\'s here! {0}...'\}".format(self.address));
       if len(clients) == 0:
           self.sendMessage("\{ 'kind' : 'update_connect', 'payload' : 'You are the first one here!'\}");
       else:
          ones_already_connected = ", ".join([c.address for c in clients ])
          client.sendMessage("\{ 'kind' : 'update_connect', 'payload' : '{0} have been expecting you...' \}".format(ones_already_connected))
       clients.append(self)

   def handleClose(self):
       clients.remove(self)


if __name__ == "__main__":

   parser = OptionParser(usage="usage: %prog [options]", version="%prog 1.0")
   parser.add_option("--host", default='', type='string', action="store", dest="host", help="hostname (localhost)")
   parser.add_option("--port", default=8000, type='int', action="store", dest="port", help="port (8000)")
   parser.add_option("--example", default='echo', type='string', action="store", dest="example", help="echo, chat")
   parser.add_option("--ssl", default=0, type='int', action="store", dest="ssl", help="ssl (1: on, 0: off (default))")
   parser.add_option("--cert", default='./cert.pem', type='string', action="store", dest="cert", help="cert (./cert.pem)")
   parser.add_option("--ver", default=ssl.PROTOCOL_TLSv1, type=int, action="store", dest="ver", help="ssl version")

   (options, args) = parser.parse_args()

   cls = SimpleEcho

   server = SimpleWebSocketServer(options.host, options.port, cls)

   def close_sig_handler(signal, frame):
      server.close()
      sys.exit()

   signal.signal(signal.SIGINT, close_sig_handler)

   server.serveforever()
