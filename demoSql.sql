ALTER   view Dis_vw_BarCodeData              
AS              
select Om.OrderID,              
Scb.BarCode,              
Tm.VehicleID,              
Sp.EInvoice_Number,     
Cm.CustID,    
Scb.Qty,    
itm.ItemName,    
itm.ItemID,  
Cm.Name as "CustName"            
From Trip_Master_New with(nolock) as Tm              
inner join Trip_Detail_New WITH(Nolock) as Td on Tm.TripID=Td.TripID              
inner  join Order_Master WITH(Nolock) as Om on Om.OrderID=Td.OrderID              
inner join SaleChallan_New WITH(Nolock) as Sm on Sm.OrderID=Om.OrderID              
inner join SaleChallanDetails_New WITH(Nolock) as Sd on Sd.ChallanMasterID =Sm.AutoID              
inner join WH_SaleChallanBarcode WITH(Nolock) as Scb on Scb.ChallanDetailId=Sd.AutoID              
inner join SalePurchase_New WITH(Nolock) as Sp on Sp.PKId=Sm.InvMasterID    
inner join SalePurchaseDetails_New WITH(Nolock) as Spd on Spd.InvAutoID=Sp.PKId              
inner join Item_Master WITH(Nolock) as itm on itm.ItemID=Spd.ItemCode    
inner join Customer_Master WITH(Nolock) as Cm on Cm.CustID=Sp.ShipToParty              
where Tm.VehicleType='Internal'              
and  cast(Scb.ScanDateTime as date)=cast(GETDATE() as date) 