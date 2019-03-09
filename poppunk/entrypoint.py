#!/usr/bin/env python

import tempfile

from PopPUNK.pathogenwatch_api import main

if __name__ == '__main__':
    with tempfile.TemporaryDirectory() as tmp_dir:
        main(tmp_dir)