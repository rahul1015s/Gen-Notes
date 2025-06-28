import React from 'react'
import { Link } from 'react-router'
import { PenSquareIcon, Trash2Icon } from 'lucide-react'
import { formatDate } from '../lib/utils.js'

const NoteCard = ({ note }) => {
    return (

        <Link to={`/note/${note._id}`}
            className=' card bg-base-100 hover:shadow-lg transition-all duration-200 border-1 border-solid'
        >
            <div className='card-body'>
                <h3 className='card-title text-base-conten/45'>{note.title}</h3>
                <p className='text-base-content/70 line-clamp-3'>{note.content}</p>
                <div className='card-actions items-center justify-between mt-4 '>
                    <span className='text-sm text-base-content/60'>{formatDate(note.createdAt)}</span>
                    <div className='flex items-center gap-1'>
                        <PenSquareIcon className='size-4' />
                    </div>
                    <button className='btn btn-ghost btn-xs text-error'>
                        <Trash2Icon className='size-4'/>
                    </button>
                </div>
            </div>

        </Link>

    )
}

export default NoteCard
