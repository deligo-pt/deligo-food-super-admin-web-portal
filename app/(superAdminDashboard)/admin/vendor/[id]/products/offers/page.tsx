import VendorCreatedOffers from '@/components/Dashboard/Vendors/VendorDetails/Products/VendorCreatedOffers';
import { getAllOffersReq } from '@/services/dashboard/offer/offer.service';
import { getSingleVendorReq } from '@/services/dashboard/vendor/vendor.service';
import { TVendor } from '@/types/user.type';

interface IProps {
    params: Promise<{ id: string }>;
}

const VendorCreatedOffersPage = async ({ params }: IProps) => {
    const { id } = await params;

    const vendorData: TVendor = await getSingleVendorReq(id);

    const offerResult = await getAllOffersReq({
        vendorId: vendorData._id,
        limit: "4",
    });

    return (
        <div>
            <VendorCreatedOffers
                vendorId={vendorData?.userId}
                offerData={offerResult?.data}
            />
        </div>
    );
};

export default VendorCreatedOffersPage;