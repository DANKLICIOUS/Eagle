#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

await yargs(hideBin(process.argv))
  .scriptName('plate')
  .usage('$0 <command>')
  .demandCommand(1)
  .help()
  .parse();
