import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns'
import { Header } from 'components'
import React, { useState } from 'react'
import type { Route } from './+types/create-trip';
import { comboBoxItems, selectItems, travelStyles } from '~/constants';
import { cn, formatKey } from '~/lib/utils';
import { Coordinate, LayerDirective, LayersDirective, MapsComponent } from '@syncfusion/ej2-react-maps';
import { world_map } from '~/constants/world_map';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { account } from '~/appwrite/client';
import { useNavigate } from 'react-router';

interface Country {
    flag: string;
    name: string;
    value: string;
    coordinates: number[];
    openStreetMap?: string;
}

export const loader = async (): Promise<Country[]> => {
    const response = await fetch(
        'https://restcountries.com/v3.1/all?fields=name,latlng,flags,maps'
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch countries: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('Expected an array of countries');
    }

    return data.map((country: any) => ({
        flag: country.flags?.png ?? '',
        name: country.name?.common ?? 'Unknown',
        coordinates: country.latlng ?? [],
        value: country.name?.common ?? 'Unknown',
        openStreetMap: country.maps?.openStreetMaps ?? '',
    }));
};

const CreateTrip = ({ loaderData }: Route.ComponentProps) => {
    const countries = loaderData as Country[];
    const navigate = useNavigate();
    const [formData, setFormData] = useState<TripFormData>({
        country: countries[0]?.name || '',
        travelStyle: '',
        interest: '',
        budget: '',
        duration: 0,
        groupType: '',

    })

    const [error, setError] = useState<String | null>(null);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        if (
            !formData.country ||
            !formData.travelStyle ||
            !formData.interest ||
            !formData.budget ||
            !formData.groupType
        ) {
            setError("Please fill in all fields.");
            setLoading(false);
            return;
        }

        if (formData.duration < 1 || formData.duration > 10) {
            setError("Duration must be between 1 and 10 days");
            setLoading(false);
            return;
        }

        const user = await account.get();
        if (!user.$id) {
            console.error("User not authenticated!");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/create-trip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    country: formData.country,
                    nummberOfDays: formData.duration,
                    travelStyle: formData.travelStyle,
                    interests: formData.interest,
                    budget: formData.budget,
                    groupType: formData.groupType,
                    userId: user.$id
                })
            })

            const result: CreateTripResponse = await response.json()
            if (result?.id) navigate(`/trips/${result.id}`)
            else console.error("Failed to generate a trip")
        } catch (e) {
            console.error("Error generating trip", e)
        } finally {
            setLoading(false)
        }
    }
    const handleChange = (key: keyof TripFormData, value: string | number) => {
        // Handle form data change
        setFormData({ ...formData, [key]: value })
    }

    const countrydata = countries.map((country) => ({
        text: country.name,
        value: country.value,
        flag: country.flag,
    }));

    const mapData = [
        {
            country: formData.country,
            color: '#EA382E',
            coordinates: countries.find((c: Country) => c.name === formData.country)?.coordinates || []
        }
    ]

    const itemTemplate = (data: any) => (
        <div className="flex items-center gap-2">
            <img
                src={data.flag}
                alt={data.text}
                className="w-6 h-4 object-cover rounded-sm"
            />
            <span>{data.text}</span>
        </div>
    );

    return (
        <main className="flex flex-col gap-10 pb-20 wrapper">
            <Header
                title="Add new Trip"
                description="View and edit AI-generated travel plans!"
            />

            <section className="mt-2.5 wrapper-md">
                <form className="trip-form" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="country">Country</label>
                        <ComboBoxComponent
                            id="country"
                            dataSource={countrydata}
                            fields={{ text: 'text', value: 'value' }}
                            placeholder="Select a Country"
                            itemTemplate={itemTemplate}
                            className="combo-box"
                            change={(e: { value: string | undefined }) => {
                                if (e.value) {
                                    handleChange('country', e.value)
                                }
                            }}

                            allowFiltering
                            filtering={(e) => {
                                const query = e.text.toLowerCase();

                                e.updateData(
                                    countries
                                        .filter((country) => country.name.toLowerCase().includes(query))
                                        .map((country) => ({
                                            text: country.name,
                                            value: country.value,
                                            flag: country.flag,  // <<< Include the flag here!
                                        }))
                                );
                            }}
                        />
                    </div>

                    <div>
                        <label htmlFor="duration">Duration</label>
                        <input
                            id="duration"
                            name='duration'
                            type='number'
                            placeholder="Enter duration in days"
                            className="form-input placeholder:text-gray-100"
                            onChange={(e) => handleChange('duration', Number(e.target.value))}
                        />
                    </div>


                    {selectItems.map((key) => (
                        <div key={key}>
                            <label htmlFor={key}>{formatKey(key)}</label>
                            <ComboBoxComponent

                                id={key}
                                dataSource={comboBoxItems[key].map((item) => ({
                                    text: item,
                                    value: item,
                                }))}

                                fields={{ text: "text", value: "value" }}
                                placeholder={`Select a ${formatKey(key)}`}
                                change={(e: { value: string | undefined }) => {
                                    if (e.value) {
                                        handleChange(key, e.value)
                                    }
                                }}

                                allowFiltering
                                filtering={(e) => {
                                    const query = e.text.toLowerCase();

                                    e.updateData(
                                        comboBoxItems[key]
                                            .filter((item) => item.toLowerCase().includes(query))
                                            .map(((item) => ({
                                                text: item,
                                                value: item,

                                            })))
                                    );
                                }}

                                className="combo-box"
                            />
                        </div>
                    ))}

                    <div>
                        <label htmlFor="location">
                            Location on the world map
                        </label>
                        <MapsComponent>
                            <LayersDirective>
                                <LayerDirective
                                    shapeData={world_map}
                                    dataSource={mapData}
                                    shapePropertyPath='name'
                                    shapeDataPath='country'
                                    shapeSettings={{ colorValuePath: "color", fill: "#e5e5e5" }}
                                />
                            </LayersDirective>
                        </MapsComponent>
                    </div>

                    <div className='bg-gray-200 h-px w-full' />

                    {error && (
                        <div className='error'>
                            <p>{error}</p>
                        </div>
                    )}

                    <footer className='px-6 w-full'>
                        <ButtonComponent type='submit' className='button-class !h-12 !w-full'
                            disabled={loading}>
                            <img src={`/assets/icons/${loading ? 'loader.svg' : 'magic-star.svg'}`} alt="submit"
                                className={cn("size-5", { 'animate-spin': loading })} />
                            <span className='p-16-semibold text-white'>
                                {loading ? 'Generating...' : "Generate Trip"}
                            </span>

                        </ButtonComponent>
                    </footer>


                </form>
            </section>
        </main>
    );
};


export default CreateTrip;
