
package com.smi.dao;

import com.smi.model.Dashboard;
import com.smi.model.DashboardUser;
import java.util.List;

/**
 *
 * @author Nejm
 */
public interface DashboardUserDao {  
    List<DashboardUser> getByUser(String username);
    List<DashboardUser> getByRole(String role_name);
    
    Long save(DashboardUser dashboard);
    void edit(DashboardUser dashboard);
}
