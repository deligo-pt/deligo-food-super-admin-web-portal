import EditZone from "@/components/Zones/EditZone";
import { getZoneById } from "@/services/dashboard/zone/zone.service";

interface IProps {
    params: Promise<{ id: string }>;
}

const EditZonePage = async ({ params }: IProps) => {
    const { id } = await params;

    const { data } = await getZoneById(id);

    return (
        <div>
            <EditZone zoneDetails={data} />
        </div>
    );
};

export default EditZonePage;