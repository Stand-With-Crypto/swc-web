import { SensitiveDataClientUserAction } from "@/clientModels/clientUserAction/sensitiveDataClientUserAction";

type nftHubProps = {
    userActions: SensitiveDataClientUserAction[] | null;
}
export function NFTHub({userActions}: nftHubProps){
    console.log('USER: ', userActions)
return( <div>fuck.</div>)
}