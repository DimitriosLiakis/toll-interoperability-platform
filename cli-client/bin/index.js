#!/usr/bin/env node

const { program } = require('commander');
const { loadEnv } = require('../lib/config');
const { fetchData, postData, updateData, deleteData } = require('../lib/api');

loadEnv(); // Load environment variables

program
    .command('get <endpoint>')
    .description('Fetch data from an endpoint')
    .action(async (endpoint) => {
        const data = await fetchData(endpoint);
        console.table(data);
    });

program
    .command('post <endpoint> <data>')
    .description('Post data to an endpoint')
    .action(async (endpoint, data) => {
        const result = await postData(endpoint, JSON.parse(data));
        console.log('Created:', result);
    });

// Similar structure for update and delete commands...

program.parse(process.argv);

