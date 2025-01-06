#!/usr/bin/env node

import { Command } from 'commander';
import { fetchRequest } from './lib/fetchRequest.js';
import { postData, updateData, deleteData } from './lib/api.js';

const program = new Command();

// CLI version
program.version('1.0.0');

// Define commands
program
    .command('fetch <endpoint>')
    .description('Fetch data from a specified endpoint')
    .action(async (endpoint) => {
        try {
            const data = await fetchRequest(endpoint);
            console.log(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    });

program
    .command('create <endpoint> <data>')
    .description('Create a new record at a specified endpoint')
    .action(async (endpoint, data) => {
        try {
            const parsedData = JSON.parse(data);
            const response = await postData(endpoint, parsedData);
            console.log('Record created:', response);
        } catch (error) {
            console.error('Error creating record:', error);
        }
    });

program
    .command('update <endpoint> <id> <data>')
    .description('Update an existing record by ID')
    .action(async (endpoint, id, data) => {
        try {
            const parsedData = JSON.parse(data);
            const response = await updateData(endpoint, id, parsedData);
            console.log('Record updated:', response);
        } catch (error) {
            console.error('Error updating record:', error);
        }
    });

program
    .command('delete <endpoint> <id>')
    .description('Delete a record by ID')
    .action(async (endpoint, id) => {
        try {
            const response = await deleteData(endpoint, id);
            console.log('Record deleted:', response);
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    });

// Parse the command line arguments
program.parse(process.argv);
