package com.smi.dao;

import com.smi.model.Role;
import java.util.List;


public interface UserAndRoleDao {
    List<String> findByUser(long id);
}
