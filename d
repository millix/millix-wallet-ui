[33mcommit d63f5cd24f98cce8602c2207afec810c72b8356d[m[33m ([m[1;36mHEAD -> [m[1;32mdate_range_pick_correction[m[33m)[m
Merge: c3bac5d 78a4552
Author: Max <max.rst@gmail.com>
Date:   Thu Oct 6 15:26:35 2022 +0200

    styles added

[33mcommit 78a45521b68743a1bc33b66f44d3f32d8611cf37[m[33m ([m[1;31morigin/develop[m[33m, [m[1;31morigin/HEAD[m[33m, [m[1;32mdevelop[m[33m)[m
Merge: ea175ce b782976
Author: millix-alex <57537379+millix-alex@users.noreply.github.com>
Date:   Tue Oct 4 12:07:21 2022 +0200

    Merge branch 'millix:main' into develop

[33mcommit c3bac5dbdd69bb7d7b871e0b78b16213dd50351c[m[33m ([m[1;31morigin/close_popovers_if_window_size_changed[m[33m, [m[1;32mclose_popovers_if_window_size_changed[m[33m)[m
Author: crank <alex.olkhovskii@404publishing.com>
Date:   Mon Oct 3 19:06:19 2022 +0200

    getTransactionHistory pass date begin, end
    remove PasswordStrength

[33mcommit b782976f4c393358a791caa9438e36c18f58be87[m
Author: millix-alex <57537379+millix-alex@users.noreply.github.com>
Date:   Mon Oct 3 17:23:01 2022 +0200

    wallet_aggregation_auto_enabled, use transaction_create_date for messages (#46)
    
    * MILLIX-176: remove zero to bool formatting, remove console.log (#56)
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    
    * MILLIX-190: changes in received(deposit) list (#57)
    
    * MILLIX-190: advertisement deposits and event log ui
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    Co-authored-by: crank <alex.olkhovskii@404publishing.com>
    
    * MILLIX-message-hotfix: remove history state from view tx button (#58)
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    
    * Millix 193 (#60)
    
    * MILLIX-193: support multiple recipient addresses in the compose form
    
    Co-authored-by: Eriksson Monteiro <erikssonmonteiro@gmail.com>
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    Co-authored-by: crank <alex.olkhovskii@404publishing.com>
    
    * chip_input empty style
    
    * send transaction switch to post
    
    * send transaction switch to post
    
    * Millix 189 (#59)
    
    * MILLIX-189: convert /report-issue into send message form
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    Co-authored-by: crank <alex.olkhovskii@404publishing.com>
    
    * report issue cosmetic fixes
    
    * change REPORT_ISSUE_ADDRESS
    
    * hide extra fields on report issue form
    
    * MILLIX-191: dns validation
    
    * MILLIX-191: dns validation
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    Co-authored-by: crank <alex.olkhovskii@404publishing.com>
    
    * MILLIX-195: fix link in error message does not work
    
    * MILLIX-195: fix link in error message does not work
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    
    * MILLIX-194: message ux improvement from 2022-06-02
    
    make the date field searchable in the inbox / sent data table
    can't collapse the message parent item in left navigation
    add the view tx button to the message page. next to reply button on top
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    Co-authored-by: crank <alex.olkhovskii@404publishing.com>
    
    * update tangled.com links
    
    * fix btn styles
    
    * fix left nav parent nav collapse
    
    * fix sidebar this.props.history.listen
    
    * MILLIX-173: add reload and close popup if page is same (#65)
    
    * MILLIX-173: reset validation on pending unspents result modal link doesn't work
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    
    * Millix 193 (#60)
    
    * MILLIX-193: support multiple recipient addresses in the compose form
    
    Co-authored-by: Eriksson Monteiro <erikssonmonteiro@gmail.com>
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    Co-authored-by: crank <alex.olkhovskii@404publishing.com>
    # Conflicts:
    #       src/css/form.scss
    #       src/js/components/message/message-compose-view.jsx
    
    * chip_input empty style
    
    * Millix 189 (#59)
    
    * MILLIX-189: convert /report-issue into send message form
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    Co-authored-by: crank <alex.olkhovskii@404publishing.com>
    
    * report issue cosmetic fixes
    
    * change REPORT_ISSUE_ADDRESS
    
    * MILLIX-191: dns validation
    
    * MILLIX-191: dns validation
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    Co-authored-by: crank <alex.olkhovskii@404publishing.com>
    
    * MILLIX-195: fix link in error message does not work
    
    * MILLIX-195: fix link in error message does not work
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    
    * MILLIX-194: message ux improvement from 2022-06-02
    
    make the date field searchable in the inbox / sent data table
    can't collapse the message parent item in left navigation
    add the view tx button to the message page. next to reply button on top
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    Co-authored-by: crank <alex.olkhovskii@404publishing.com>
    
    * update tangled.com links
    
    * fix btn styles
    
    * fix left nav parent nav collapse
    
    * fix sidebar this.props.history.listen
    
    * MILLIX-173: add reload and close popup if page is same (#65)
    
    * MILLIX-173: reset validation on pending unspents result modal link doesn't work
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    
    * Millix 192 (#67)
    
    MILLIX-192: translate ui
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    Co-authored-by: crank <alex.olkhovskii@404publishing.com>
    
    * fix aggregation button loader
    
    * Millix 189 (#59)
    
    * MILLIX-189: convert /report-issue into send message form
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    Co-authored-by: crank <alex.olkhovskii@404publishing.com>
    
    * report issue cosmetic fixes
    
    * MILLIX-191: dns validation
    
    * MILLIX-191: dns validation
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    Co-authored-by: crank <alex.olkhovskii@404publishing.com>
    
    * fix btn styles
    
    * fix left nav parent nav collapse
    
    * fix sidebar this.props.history.listen
    
    * Millix 193 (#60)
    
    * MILLIX-193: support multiple recipient addresses in the compose form
    
    Co-authored-by: Eriksson Monteiro <erikssonmonteiro@gmail.com>
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    Co-authored-by: crank <alex.olkhovskii@404publishing.com>
    # Conflicts:
    #       src/css/form.scss
    #       src/js/components/message/message-compose-view.jsx
    
    * chip_input empty style
    
    * Millix 189 (#59)
    
    * MILLIX-189: convert /report-issue into send message form
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    Co-authored-by: crank <alex.olkhovskii@404publishing.com>
    
    * report issue cosmetic fixes
    
    * change REPORT_ISSUE_ADDRESS
    
    * MILLIX-191: dns validation
    
    * MILLIX-191: dns validation
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    Co-authored-by: crank <alex.olkhovskii@404publishing.com>
    
    * fix btn styles
    
    * fix left nav parent nav collapse
    
    * fix sidebar this.props.history.listen
    
    * Millix 192 (#67)
    
    MILLIX-192: translate ui
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    Co-authored-by: crank <alex.olkhovskii@404publishing.com>
    
    * fix aggregation button loader
    
    * hide disabled languages
    
    * show_phrase_guid
    
    * fix phrase replacement of multiple variables
    
    * Millix 192 (#71)
    
    * MILLIX-192: translation: fix not unique key react console errors
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    Co-authored-by: crank <alex.olkhovskii@404publishing.com>
    
    * MILLIX-199: fix href (#72)
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    
    * MILLIX-192: fix translation and merge (#70)
    
    fix date sort on messages
    
    Co-authored-by: AShulpekov <ash52131@gmail.com>
    Co-authored-by: crank <alex.olkhovskii@404publishing.com>
    
    * MILLIX-193: a