import ZoneDetails from "@/components/Zones/ZoneDetails";
import { getZoneById } from "@/services/dashboard/zone/zone.service";

interface IProps {
    params: Promise<{ id: string }>;
}

const ZoneDetailsPage = async ({ params }: IProps) => {
    const { id } = await params;

    const { data } = await getZoneById(id);

    return (
        <div>
            <ZoneDetails zoneDetails={data} />
        </div>
    );
};

export default ZoneDetailsPage;