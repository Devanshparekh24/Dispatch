select um.Mobile,um.UserID,um.UserName,um.UserName,em.DOCUMENT_IMAGE From User_Master as um
left join PRL_EMP_DOCUMENT as em
on um.EmpCode=em.EMP_CODE
where um.IsEmployee=1 and em.DOCUMENT_TYPE='PHOTO'
