import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.14.0'
import { corsHeaders } from '../_shared/cors.ts'

// deletes account and removes all data related to the user
serve(async (req) => {
  try {
    // creates supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { 
            Authorization: req.headers.get('Authorization')! 
          } 
        },
        auth: {
          persistSession: false
        }
      }
    )

    // gets user from auth
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()
    
    // gets user images from profile
    const { data: profiles, error: userError } = await supabaseClient.from('profiles').select().eq('id', user.id)
    if (userError) throw userError
    const user_images = [profiles[0].imageOne, profiles[0].imageTwo, profiles[0].imageThree, profiles[0].imageFour].filter((value) => value !== null)

    // creates an admin supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: {persistSession: false} }
    )

    // deletes users images from storage
    const { data: avatar_deletion, error: avatar_error } = await supabaseAdmin
      .storage
      .from('avatars')
      .remove(user_images)
    if (avatar_error) throw avatar_error

    // deletes users locations from db
    const { data: locations_deletion, error: locations_error } = await supabaseAdmin
      .from('locations')
      .delete()
      .eq('user', user.id)
    if (locations_error) throw locations_error

    // deletes users potmatches from db
    const { data: potmatches_deletion, error: potmatches_error } = await supabaseAdmin
      .from('potmatches')
      .delete()
      .or(`user_one.eq.${user.id},user_two.eq.${user.id}`)
    if (potmatches_error) throw potmatches_error

    // deletes users matches from db
    const { data: matches_deletion, error: matches_error } = await supabaseAdmin
      .from('matches')
      .delete()
      .or(`user_one.eq.${user.id},user_two.eq.${user.id}`)
      .select()
    if (matches_error) throw matches_error
  
    const match_ids = matches_deletion.map(match => match.id)

    // deletes users messages from db
    const { data: messages_deletion, error: messages_error } = await supabaseAdmin
      .from('messages')
      .delete()
      .in('match_id', match_ids)
    if (messages_error) throw messages_error

    // deletes user from db
    const { data: deletion_data, error: deletion_error } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (deletion_error) throw deletion_error

    return new Response("User deleted", {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
