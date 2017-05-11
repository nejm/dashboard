package com.smi.dao;

import com.smi.model.Role;
import com.smi.model.Usersandroles;
import java.util.List;

public interface UserAndRoleDao {

    List<Usersandroles> findByUser(long id);
    
    List<Usersandroles> findByRole(long id);
    
    Long add(Usersandroles uar);

    void delete(Usersandroles uar);
}
