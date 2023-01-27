"""A thread for a control channel."""
from threading import Thread

from tornado.ioloop import IOLoop


class ControlThread(Thread):
    """A thread for a control channel."""

    def __init__(self, **kwargs):
        """Initialize the thread."""
        Thread.__init__(self, name="Control", **kwargs)
        self.io_loop = IOLoop(make_current=False)
        self.pydev_do_not_trace = True
        self.is_pydev_daemon_thread = True

    def run(self):
        """Run the thread."""
        self.name = "Control"
        try:
            self.io_loop.start()
        finally:
            self.io_loop.close()

    def stop(self):
        """Stop the thread.

        This method is threadsafe.
        """
        self.io_loop.add_callback(self.io_loop.stop)
