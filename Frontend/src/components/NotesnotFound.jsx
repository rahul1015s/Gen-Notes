import React from 'react'
import { NotebookPen } from 'lucide-react';
import { Link } from 'react-router';

const NotesnotFound = () => {
    return (
        <div className='flex flex-col items-center justify-center m-4'>
            <div className='m-4'>
                <NotebookPen className='size-10 text-shadow-primary m-4' />
                <h1 className='text-2xl font-mono mb-4'>Notes not found please Create one.</h1>
                <Link to={"/create"}>
                    <button className='btn btn-dash'>Create Note</button>
                </Link>
            </div>

        </div>
    )
}

export default NotesnotFound
