package com.smi.service;

import com.smi.dao.RoleDaoImpl;
import com.smi.model.Role;
import java.util.List;
import org.springframework.stereotype.Service;

@Service("roleService")
public class RoleServiceImpl implements RoleService{

    RoleDaoImpl roleDaoImpl = new RoleDaoImpl();
    
    @Override
    public List<Role> findAll() {
        
        return roleDaoImpl.findAll();
    }
    
}
