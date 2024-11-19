
import React from 'react'
import { Stack } from 'expo-router'
import HomeHeader from '@/components/HomeHeader';
import MessageHeader from '@/components/MessageHeader';
import NavigatorHeader from '@/components/NavigatorHeader';
import OwnerDashboardHeader from '@/components/OwnerDashboardHeader';
import { FilterProvider } from './FilterContext';
export default function _layout() {
  return (
    <FilterProvider>
    <Stack>
      <Stack.Screen
        name='Dashboard'
        options={{
          header: ()=> <NavigatorHeader/>
        }}
      />
      <Stack.Screen
        name='Notification'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />
      <Stack.Screen
        name='SearchFilter'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

            <Stack.Screen
        name='MaintenanceRequest'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Documents'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Property'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />
      
      <Stack.Screen
        name='UpgradeToPropertyOwner/upgradeToOwner'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='UpgradeToPropertyOwner/upgradeRequestSubmitted'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Reports/ReportProfile/submittedReportProfile'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Reports/ReportProfile/reportProfile'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Reports/ReportProfile/reportProfileNextStep'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      {/*<Stack.Screen
        name='Reports/ReportProfile/violations'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Reports/ReportProfile/fraud'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Reports/ReportProfile/behavior'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Reports/ReportProfile/rentalIssues'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Reports/ReportProfile/security'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Reports/ReportProfile/content'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Reports/ReportProfile/other'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />*/}

      <Stack.Screen
        name='Reports/ReportProperty/reportProperty'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Reports/ReportProperty/reportPropertyNextStep'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Reports/ReportProperty/describe'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Reports/ReportProperty/submittedReportProperty'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      {/*<Stack.Screen
        name='Reports/ReportProperty/listingAccuracy'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />
      
      <Stack.Screen
        name='Reports/ReportProperty/propertyAvailability'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Reports/ReportProperty/legal'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Reports/ReportProperty/communicationIssues'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Reports/ReportProperty/discrimination'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Reports/ReportProperty/other'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />*/}

      <Stack.Screen
        name='LeaseProperty/PropertyDashboard'
        options={{
          header: ()=> <OwnerDashboardHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/AddProperty/addNewProperty'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/AddProperty/addPropertyLocation'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/AddProperty/addRentalDetails'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/AddProperty/addUtilityFees'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/AddProperty/addTerms&Condition'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />
      
      <Stack.Screen
        name='LeaseProperty/Tenant/tenants'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/Tenant/tenantDetails'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/Tenant/tenantPaymentHistorySchedule'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/Tenant/PendingApplication'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/Tenant/setContractDetails'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />
      
      <Stack.Screen
        name='LeaseProperty/Tenant/contractPreview'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/Tenant/contractSuccess'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/Maintenance/maintenance'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/Maintenance/ViewMaintenance'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/Revenue/revenue'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/Revenue/viewRevenue'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/Revenue/TransferRevenue/transferRevenue'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/Revenue/TransferRevenue/reviewTransaction'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/Revenue/TransferRevenue/receiptTransaction'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/OwnerNotification'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/OwnerProfile'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      

      <Stack.Screen
        name='LeaseProperty/PropertyDetails'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/Property/ViewPropertyDetails'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/Property/EditProperty/editProperty'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/Property/EditProperty/editPropertyLocation'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/Property/EditProperty/editRentalDetails'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='LeaseProperty/Property/EditProperty/editTerms&Condition'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='MyLease/TerminateContract/terminateContract'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='MyLease/ViewContract'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='MyLease/ReceivedContract'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='MyLease/payDepositeAdvance'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='MyLease/successContract'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='MyLease/paymentHistorySchedule'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/RentalHistory/RentalHistory'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/RentalHistory/RentalDetails'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/Wallet/wallet'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />
      <Stack.Screen
        name='Profile/Wallet/walletPin'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/LegalDocuments'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />
      
      <Stack.Screen
        name='Profile/ReportIssue'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />
      

      <Stack.Screen
        name='Profile/profile'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/changePassword'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/changePin'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/changePinSetNew'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />


      <Stack.Screen
        name='Profile/DeleteAccount'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/TrackApplication/TrackApplication'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/TrackApplication/ApplicationDetails'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/TrackMaintenance/trackMaintenance'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/TrackMaintenance/MaintenanceDetails'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      

      <Stack.Screen
        name='Profile/AccountInformation'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />   

      <Stack.Screen
        name='Profile/EditAccountVerify'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />   

      <Stack.Screen
        name='Profile/EditAccountSuccess'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />   

      <Stack.Screen
        name='Message/MessageDashboard'
        options={{
          header: ()=> <MessageHeader/>
        }}
      />

      <Stack.Screen
        name='Message/msgDetails'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/Wallet/TopUp/topUp'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/Wallet/TopUp/reviewTransaction'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/Wallet/TopUp/receiptTransaction'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      

      <Stack.Screen
        name='Profile/Wallet/Transfer/transfer'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/Wallet/Transfer/transferReviewTransaction'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/Wallet/Transfer/transferReceipt'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/Wallet/Payment/payment'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/Wallet/Payment/paymentReview'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/Wallet/Payment/paymentReceipt'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/Wallet/Withdraw/withdraw'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/Wallet/Withdraw/withdrawReviewTransaction'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

      <Stack.Screen
        name='Profile/Wallet/Withdraw/withdrawReceipt'
        options={{
          header: ()=> <HomeHeader/>
        }}
      />

    </Stack>
    </FilterProvider>
  )
}