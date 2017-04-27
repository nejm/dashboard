package com.smi.service;

import com.smi.model.Role;
import java.util.List;


public interface RoleService {
    List<Role> findAll();
    Role findById(long id);
    Role findByName(String name);
}
