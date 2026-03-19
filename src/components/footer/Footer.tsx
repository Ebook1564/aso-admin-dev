import React from 'react';

const Footer = () => {
    return (
        <footer className='mt-12 py-8 border-t border-gray-100 dark:border-gray-800 flex flex-col items-center gap-2'>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                Designed and Developed by <a href="https://tailadmin.com/" target='_blank' className='text-brand-500 hover:text-brand-600 font-bold'>SnappGames</a>
            </p>
            <p className='text-[11px] text-gray-400 dark:text-gray-500'>
                Distributed by <a href="https://www.taraapplications.com" target='_blank' className='hover:text-brand-500 transition-colors underline decoration-gray-200 dark:decoration-gray-700 underline-offset-4'>Tara Applications</a>
            </p>
        </footer>
    );
};

export default Footer;