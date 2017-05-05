package com.smi.service;

import com.smi.model.Statuser;
import java.util.List;

/**
 *
 * @author Nejm
 */
public interface StatUserService {

    void save(Statuser statuser);

    void edit(Statuser statuser);

    List<Statuser> findByUser(String username);

    List<Statuser> findByRole(String roleName);
    
    void delete(Statuser s);
    
    List<Statuser> findByStats(Long id);
}
