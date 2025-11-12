import React from 'react'
import { Header } from 'components'


const Trips = () => {
    return (
        <main className='all-users wrapper'>
            <Header
                title="Trips"
                description="View and Edit AI-generated travel plans!"
                ctaText="Create a Trip"
                ctaUrl="/trips/create" />
        </main>
    )
}

export default Trips
