
package com.smi.service;

import com.smi.model.Users;
import java.util.List;

/**
 *
 * @author Nejm
 */
public interface UserService {
    
    Users findByUsername(String username);
    List<Users> findAll();
}
