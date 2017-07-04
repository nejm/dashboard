
package com.smi.dao;

import com.smi.model.Role;
import java.util.List;

public interface RoleDao {
    Role findById(long id);
    List<Role> findAll();
    
    Long save(Role role);
    Role findByName(String name);
    void delete(Role role);
}
