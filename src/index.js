#!/usr/bin/env node

'use strict';

const script = require( 'path' ).join( __dirname, '../vendor/sonarlint-cli-2.1.0.566/bin', 'sonarlint' );

let args = process.argv.slice( 2 );
let command;

if ( process.platform === 'win32' ) {
    command = 'cmd.exe';
    args = [ '/c', ( script + '.bat' ) ].concat( args );
} else {
    command = script;
}

const childProcess = require( 'child_process' ).spawn( command, args );

let exitCode = 0;

childProcess.stdout.on( 'data', function ( data ) {
    const output = data.toString();

    let match;
    let exitNow = false;
    process.stdout.write( output );
    //`const regex = /^.* (([\d]+) critical| ([\d]+) blocker).*$/gm;
    //const regex = /^.*([\d]+) critical.*$|^.* ([\d]+) blocker.*$/gm;
    const regex = /^.* ([\d]+) (?:blocker|critical).*$/gm;
    var matches = [];
    while( (match = regex.exec( output ))!==null ) {
    if (match.index === regex.lastIndex) {
            regex.lastIndex++;
        }
    //if( match = /^.* ([\d]+) critical.*$|^.* ([\d]+) blocker.*$/gm.exec( output ) ) {
    matches.push(match);
    exitNow = true;
    }
    if(exitNow) {
    console.log(matches);
    matches.forEach(function(matched){
        if(matched[1]) exitCode += parseInt(matched[1])
    })
    console.log(exitCode)
    }
} );

childProcess.on( 'error', function( data ) {
    process.stderr.write( data.toString() );
} );

childProcess.on( 'close', function ( code ) {
    if( code === 0 ) {
        process.exit( exitCode );
    }

    process.exit( code );
} );

process.on( 'SIGINT', () => {
    childProcess.kill();
} );

process.stdin.resume();
